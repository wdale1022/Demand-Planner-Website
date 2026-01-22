import express from 'express';
import multer from 'multer';
import { BudgetTrackerParser } from '../services/excelParser.js';
import { db } from '../models/database.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ];

    if (allowedTypes.includes(file.mimetype) ||
        file.originalname.match(/\.(xlsx|xls|xlsm)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls, .xlsm) are allowed'));
    }
  },
});

/**
 * POST /api/upload
 * Upload and parse budget tracker Excel files
 */
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const demandType = req.body.demandType as 'Hard Demand' | 'Soft Demand' || 'Hard Demand';

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];

    for (const file of files) {
      try {
        // Parse the Excel file
        const parser = new BudgetTrackerParser();
        const parseResult = parser.parse(file.buffer, demandType);

        // Insert records into database
        let recordsImported = 0;
        const insertStmt = db.prepare(`
          INSERT INTO hours (
            project, employee_id, resource_name, rate, activity_id,
            week_start_date, actual_or_proposed, hours, demand_type,
            project_id, phase, milestone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((records) => {
          for (const record of records) {
            insertStmt.run(
              record.project,
              record.employeeId,
              record.resourceName,
              record.rate,
              record.activityId,
              record.weekStartDate,
              record.actualOrProposed,
              record.hours,
              record.demandType,
              record.projectId,
              record.phase,
              record.milestone
            );
            recordsImported++;
          }
        });

        insertMany(parseResult.records);

        // Track upload in database
        db.prepare(`
          INSERT INTO file_uploads (filename, records_imported, errors, warnings)
          VALUES (?, ?, ?, ?)
        `).run(
          file.originalname,
          recordsImported,
          JSON.stringify(parseResult.errors),
          JSON.stringify(parseResult.warnings)
        );

        results.push({
          filename: file.originalname,
          recordsImported,
          errors: parseResult.errors,
          warnings: parseResult.warnings,
          success: parseResult.errors.length === 0,
        });

      } catch (error) {
        results.push({
          filename: file.originalname,
          recordsImported: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
          success: false,
        });
      }
    }

    res.json({
      success: results.every(r => r.success),
      results,
      totalRecordsImported: results.reduce((sum, r) => sum + r.recordsImported, 0),
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * DELETE /api/upload/clear
 * Clear all hours data
 */
router.delete('/clear', (req, res) => {
  try {
    db.prepare('DELETE FROM hours').run();
    db.prepare('DELETE FROM file_uploads').run();

    res.json({
      success: true,
      message: 'All data cleared successfully',
    });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

/**
 * GET /api/upload/history
 * Get upload history
 */
router.get('/history', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT
        id,
        filename,
        uploaded_at as uploadedAt,
        records_imported as recordsImported,
        errors,
        warnings
      FROM file_uploads
      ORDER BY uploaded_at DESC
      LIMIT 50
    `).all();

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

export default router;

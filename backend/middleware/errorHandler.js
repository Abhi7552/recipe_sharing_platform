const multer = require('multer');

// Centralized error handler, registered last in server.js.
// Known, safe-to-show client errors (bad JSON body, oversized upload, disallowed file
// type, oversized request body) return their message. Anything else is logged on the
// server and a generic message is sent to the client, so internal details never leak.
function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ message: 'Request body is too large.' });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Malformed JSON in request body.' });
  }

  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'Image must be 5MB or smaller.',
      LIMIT_FILE_COUNT: 'Only one image can be uploaded per recipe.',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field.',
    };
    return res.status(400).json({ message: messages[err.code] || 'Could not process the uploaded file.' });
  }

  // Our own upload.js fileFilter throws a plain Error with a safe, user-facing message.
  if (err instanceof Error && /image/i.test(err.message)) {
    return res.status(400).json({ message: err.message });
  }

  console.error('Unexpected server error:', err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = errorHandler;

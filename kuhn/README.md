# Back-End Structure:

# Back-End Standards:
- Every feature MUST contain a single 'index.js'
- Any file that requires 'string-format' must enable method mode
- No index 'index.js' can contain computations relevant to its respective feature
- All middleware functions for a given feature MUST be in the feature's 'index.js'
- Every feature (not including main or routes) MUST initialize module.exports.middleware as a function
- If a feature's 'index.js' does not export any middleware functions through module.exports.middleware, it must log this with an IIFE
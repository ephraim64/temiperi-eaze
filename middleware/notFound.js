// export const notFound = (req, res) => {
//    return res.status(500).json({sucess: false, message: 'No Prduct Found'})
// }

export const notFound = (req, res, next) => { // Add 'next' to handle other middlewares
   const error = new Error(`Not Found - ${req.originalUrl}`); // Create an error message
   res.status(404); // Set the status code to 404 (Not Found)
   next(error);       // Pass the error to the next middleware (errorHandler)
 };
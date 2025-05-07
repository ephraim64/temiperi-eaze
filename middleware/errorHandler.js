// export const errorHandler = async (err, req, res, next) => {
//    return res.status(404).json({success: false, message: 'Not Found'})
// }



export const errorHandler = (err, req, res, next) => {
   const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Check for existing status
   res.status(statusCode); // Use the existing status code if it exists, otherwise default to 500
 
   res.json({
     success: false,  // add a success field
     message: err.message,
  //   stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Show stack only in development
   });
 };
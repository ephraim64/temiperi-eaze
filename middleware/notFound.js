export const notFound = (req, res) => {
   return res.status(500).json({sucess: false, message: 'No Prduct Found'})
}
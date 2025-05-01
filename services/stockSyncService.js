import ProductModel from '../models/productModel.js';

/**
 * Stock Synchronization Service
 * Handles all stock-related operations and synchronization with invoices
 */
class StockSyncService {
  /**
   * Update stock quantity based on invoice changes
   * @param {Array} items - Array of items from invoice
   * @param {String} operation - 'add' or 'subtract' to indicate stock movement
   * @returns {Promise<Object>} - Result of the operation
   */
  static async updateStockFromInvoice(items, operation = 'subtract') {
    try {
      const results = [];
      
      for (const item of items) {
        const product = await ProductModel.findOne({ name: item.description });
        
        if (!product) {
          throw new Error(`Product not found: ${item.description}`);
        }

        // Calculate new quantity based on operation
        const newQuantity = operation === 'subtract' 
          ? product.quantity - item.quantity 
          : product.quantity + item.quantity;

        // Ensure quantity doesn't go below 0
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for product: ${item.description}`);
        }

        // Update product quantity
        const updatedProduct = await ProductModel.findByIdAndUpdate(
          product._id,
          { quantity: newQuantity },
          { new: true }
        );

        results.push({
          productId: product._id,
          productName: product.name,
          oldQuantity: product.quantity,
          newQuantity: updatedProduct.quantity,
          change: operation === 'subtract' ? -item.quantity : item.quantity
        });
      }

      return {
        success: true,
        message: 'Stock updated successfully',
        results
      };
    } catch (error) {
      console.error('Stock sync error:', error);
      throw error;
    }
  }

  /**
   * Revert stock changes from a deleted invoice
   * @param {Array} items - Array of items from deleted invoice
   * @returns {Promise<Object>} - Result of the operation
   */
  static async revertStockFromDeletedInvoice(items) {
    return this.updateStockFromInvoice(items, 'add');
  }

  /**
   * Handle stock updates for edited invoice
   * @param {Array} oldItems - Original items from invoice
   * @param {Array} newItems - Updated items from invoice
   * @returns {Promise<Object>} - Result of the operation
   */
  static async handleEditedInvoiceStock(oldItems, newItems) {
    try {
      // First, revert the old items (add back to stock)
      await this.updateStockFromInvoice(oldItems, 'add');
      
      // Then, subtract the new items from stock
      return await this.updateStockFromInvoice(newItems, 'subtract');
    } catch (error) {
      console.error('Error handling edited invoice stock:', error);
      throw error;
    }
  }
}

export default StockSyncService; 
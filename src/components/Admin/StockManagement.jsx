import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const StockManagement = () => {
  const [stock, setStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    fetchStock();
    fetchLowStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await fetch('/api/stock');
      const data = await response.json();
      if (data.success) {
        setStock(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch stock');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await fetch('/api/stock/low-stock');
      const data = await response.json();
      if (data.success) {
        setLowStock(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch low stock items');
    }
  };

  const updateStock = async (productId, sizeId, newQuantity) => {
    try {
      const response = await fetch('/api/stock/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          size_id: sizeId,
          quantity: newQuantity
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Stock updated successfully');
        fetchStock();
        fetchLowStock();
        setEditingStock(null);
      } else {
        toast.error(data.error || 'Failed to update stock');
      }
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const getStockLevel = (quantity, reorderLevel) => {
    if (quantity === 0) return { color: 'danger', text: 'Out of Stock' };
    if (quantity <= reorderLevel) return { color: 'warning', text: 'Low Stock' };
    return { color: 'success', text: 'In Stock' };
  };

  const groupedStock = stock.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = {
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        image_url: item.image_url,
        sizes: {}
      };
    }
    acc[item.product_id].sizes[item.size_id] = item;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Stock Management</h4>
        <div>
          {lowStock.length > 0 && (
            <span className="badge bg-warning text-dark me-2">
              <AlertTriangle size={16} className="me-1" />
              {lowStock.length} Low Stock Items
            </span>
          )}
          <span className="badge bg-info">
            <Package size={16} className="me-1" />
            {stock.length} Products
          </span>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="alert alert-warning mb-4">
          <h6><AlertTriangle size={18} className="me-2" />Low Stock Alert!</h6>
          <p className="mb-0">The following products need to be restocked:</p>
          <ul className="mb-0">
            {lowStock.map(item => (
              <li key={`${item.product_id}-${item.size}`}>
                {item.product_name} - Size {typeof item.size === 'string' ? item.size : JSON.stringify(item.size)} (Only {item.quantity} left)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stock Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              {Object.values(groupedStock).length > 0 && Object.keys(groupedStock[Object.keys(groupedStock)[0]].sizes).map(sizeId => {
                const size = groupedStock[Object.keys(groupedStock)[0]].sizes[sizeId];
                return <th key={sizeId}>{size?.size_name || 'N/A'}</th>;
              })}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedStock).map(product => (
              <tr key={product.product_id}>
                <td>
                  <div className="d-flex align-items-center">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.product_name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                      />
                    )}
                    <div>
                      <div>{product.product_name}</div>
                      <small className="text-muted">SKU: {product.sizes[Object.keys(product.sizes)[0]]?.sku || 'N/A'}</small>
                    </div>
                  </div>
                </td>
                <td>${product.price}</td>
                
                {/* Size columns */}
                {Object.keys(product.sizes).map(sizeId => {
                  const sizeData = product.sizes[sizeId];
                  const stockLevel = sizeData ? getStockLevel(sizeData.quantity, sizeData.reorder_level) : { color: 'secondary', text: 'N/A' };
                  
                  return (
                    <td key={sizeId}>
                      {editingStock === `${product.product_id}-${sizeId}` ? (
                        <div className="d-flex align-items-center">
                          <input
                            type="number"
                            className="form-control form-control-sm me-1"
                            style={{ width: '70px' }}
                            value={editingStock === `${product.product_id}-${sizeId}` ? editingStock.quantity : sizeData?.quantity || 0}
                            onChange={(e) => setEditingStock({ ...editingStock, quantity: parseInt(e.target.value) || 0 })}
                            min="0"
                          />
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => updateStock(product.product_id, sizeId, editingStock.quantity)}
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-secondary ms-1"
                            onClick={() => setEditingStock(null)}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-between">
                          <span className={`badge bg-${stockLevel.color} text-white`}>
                            {sizeData?.quantity || 0}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditingStock({ product_id: product.product_id, sizeId, quantity: sizeData?.quantity || 0 })}
                          >
                            <Minus size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
                
                <td>
                  {(() => {
                    const totalQuantity = Object.values(product.sizes).reduce((sum, size) => sum + (size?.quantity || 0), 0);
                    const minReorderLevel = Math.min(...Object.values(product.sizes).map(size => size?.reorder_level || 10));
                    
                    if (totalQuantity === 0) return <span className="badge bg-danger">Out of Stock</span>;
                    if (totalQuantity <= minReorderLevel) return <span className="badge bg-warning">Low Stock</span>;
                    return <span className="badge bg-success">In Stock</span>;
                  })()}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => fetchStock()}
                  >
                    Refresh
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stock.length === 0 && (
        <div className="text-center py-4">
          <Package size={48} className="text-muted mb-3" />
          <h5>No Stock Data Available</h5>
          <p className="text-muted">Stock information will appear here once products are added.</p>
        </div>
      )}
    </div>
  );
};

export default StockManagement;

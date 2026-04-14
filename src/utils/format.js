export const formatPrice = (value) => `${Number(value || 0).toFixed(0)} د.م`

export const getStatusLabel = (status) => {
  const labels = {
    new: 'جديدة',
    confirmed: 'مؤكدة',
    delivered: 'تم التوصيل',
  }
  return labels[status] || 'جديدة'
}

export const categoryLabel = (category) => {
  const labels = {
    hijabs: 'الحجابات',
    produits: 'المنتجات',
    abayas: 'العباءات',
  }
  return labels[category] || category
}

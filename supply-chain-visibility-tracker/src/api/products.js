import client from './client'

export const fetchProducts = () => client.get('/products').then(r => r.data)
export const createProduct = (p) => client.post('/products', p).then(r => r.data)

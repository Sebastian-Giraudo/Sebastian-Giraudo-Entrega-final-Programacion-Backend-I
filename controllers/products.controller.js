import { Product } from '../dao/models/Product.js';
import buildPaginationLinks from '../utils/paginateLinks.js';

export const getProducts = async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;
    const filter = query ? { $or: [ { category: query }, { status: query === 'true' } ] } : {};
    const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

    const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    sort: sortOption,
    lean: true
    };

    const result = await Product.paginate(filter, options);
    const { prevLink, nextLink } = buildPaginationLinks('/products', req.query, result);

    res.render('products', {
    products: result.docs,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink,
    nextLink,
    page: result.page,
    totalPages: result.totalPages
    });
    };

    export const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.pid).lean();
    res.render('productDetail', { product });
};
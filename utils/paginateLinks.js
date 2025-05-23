export default function buildPaginationLinks(base, query, result) {
    const buildLink = (page) => {
    const q = new URLSearchParams({ ...query, page }).toString();
    return `${base}?${q}`;
    };

    return {
    prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
    nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
    };
    }

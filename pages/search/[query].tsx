import type { NextPage, GetServerSideProps } from 'next';
import { Typography, Box } from '@mui/material';

import { ShopLayout } from '../../components/layouts';
import { ProductList } from '../../components/products/ProductList';

import { dbProducts } from '../../database';
import { IProduct } from '../../interfaces/products';

interface Props {
    products: IProduct[];
    foundProducts: boolean;
    query: string;
}


const SearchPage: NextPage<Props> = ({ products, foundProducts, query }) => {


  return (
    <ShopLayout title={'Teslo-Shop - Search'} pageDescription={'Encuentra los mejores productos de Teslo aquí'}>
      <Typography variant='h1' component='h1' sx={{ mb: 1 }}>Buscar productos</Typography>

      {
          foundProducts
          ? <Typography variant='h2' sx={{ mb: 1 }}>Resultados de la búsqueda: { query }</Typography>
          : (
                <>
                    <Box display='flex'>
                        <Typography variant='h2'>No encontramos ningún producto con el término:</Typography>
                        <Typography variant='h2' sx={{ ml: 2 }} color='secondary'>{ query }</Typography>
                    </Box>
                    <Typography variant='h2' sx={{ mb: 3 }}>En su lugar te mostramos estos productos:</Typography>
                </>
            )
      }

      <ProductList products={ products } />
      
    </ShopLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

    const { query = '' } = params as { query: string };

    if ( query.length === 0 ) {
        return {
            redirect: {
                destination: '/',
                permanent: true
            }
        }
    }

    let products = await dbProducts.getProductsByTerm( query );
    const foundProducts = products.length > 0;

    if ( !foundProducts ) {
        products = await dbProducts.getAllProducts();

    }

    return {
        props: {
            products,
            foundProducts,
            query
        }
    }
}

export default SearchPage

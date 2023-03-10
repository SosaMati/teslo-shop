import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';

import { Box, CardContent, Chip, Divider, Grid, Typography } from '@mui/material';
import CreditCardOffOutlined from '@mui/icons-material/CreditCardOffOutlined';
import CreditScoreOutlined from '@mui/icons-material/CreditScoreOutlined';

import { ShopLayout } from '../../components/layouts/ShopLayout';
import { CartList, OrderSummary } from '../../components/cart';
import { dbOrders } from '../../database';
import { IOrder } from '../../interfaces/order';

interface Props {
    order: IOrder
}

const OrderPage: NextPage<Props> = ({ order }) => {

    const { shippingAddress } = order;

    
  return (
    <ShopLayout title='Resumen de la orden' pageDescription={'Resumen de la orden'}>
        <Typography variant='h1' component='h1'>Orden: {order._id }</Typography>

        {
            order.isPaid
            ? (
                <Chip 
                    sx={{ mt: 2 }}
                    label='La orden ya fue pagada'
                    variant='outlined'
                    color='success'
                    icon={ <CreditScoreOutlined /> }
                />
            ):
            (
                <Chip 
                    sx={{ mt: 2 }}
                    label='Pendiente de pago'
                    variant='outlined'
                    color='error'
                    icon={ <CreditCardOffOutlined /> }
                /> 
            )
        }

        <Grid container className='fadeIn'>
            <Grid item xs={ 12 } sm={ 7 }>
                <CartList products={ order.orderItems } />
            </Grid>
            <Grid item xs={ 12 } sm={ 5 }>
                <Grid className='summary-card'>
                    <CardContent>
                        <Typography variant='h2'>Resumen ({ order.numberOfItems } { order.numberOfItems > 1 ? 'productos' : 'producto' })</Typography>
                        <Divider sx={{ my:1 }}/>

                        <Box display='flex' justifyContent='space-between'>
                            <Typography variant='subtitle1'>Direcci??n de entrega</Typography>
                        </Box>

                        <Typography>{ shippingAddress.firstName } { shippingAddress.lastName }</Typography>
                        <Typography>{ shippingAddress.address } { shippingAddress.address2 ? `, ${ shippingAddress.address2 }` : '' }</Typography>
                        <Typography>{ shippingAddress.city }</Typography>
                        <Typography>CP: { shippingAddress.zip }</Typography>
                        <Typography>{ shippingAddress.country }</Typography>
                        <Typography>{ shippingAddress.phone }</Typography>

                        <Divider sx={{ my:1 }}/>

                        <OrderSummary 
                            orderValues={{
                                numberOfItems: order.numberOfItems,
                                subTotal: order.subTotal,
                                total: order.total,
                                tax: order.tax,
                            }} 
                        />

                        <Box sx={{ mt:3 }} display='flex' flexDirection='column'>
                            {/* todo */}
                            {
                                order.isPaid
                                ? (
                                    <Chip 
                                        sx={{ mt: 2 }}
                                        label='La orden ya fue pagada'
                                        variant='outlined'
                                        color='success'
                                        icon={ <CreditScoreOutlined /> }
                                    />
                                ):
                                (
                                    <h1>Pagar</h1>
                                )
                            }
                            
                        </Box>
                    </CardContent>
                </Grid>
            </Grid>

        </Grid>
    </ShopLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {

    const { id = '' } = query;
    const session:any = await getSession({ req });

    if (!session) {
        return {
            redirect: {
                destination: `/auth/login?p=/orders/${ id }`,
                permanent: false,
            }
        }
    }

    const order = await dbOrders.getOrderById( id.toString() );

    if (!order) {
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false,
            }
        }
    }

    if ( order.user !== session.user._id ) {
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false,
            }
        }
    }

    return {
        props: {
            order
        }
    }
}


export default OrderPage
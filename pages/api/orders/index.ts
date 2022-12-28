import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { db } from '../../../database';
import { IOrder } from '../../../interfaces';
import { Order, Product } from '../../../models';

type Data = 
| { message: string }
| IOrder

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch( req.method ) {
        case 'POST':
            return createOrder( req, res );
        default:
            return res.status(400).json({ message: 'Bad request' })
    }
}

const createOrder = async(req: NextApiRequest, res: NextApiResponse<Data>) =>{

    const { orderItems, total } = req.body as IOrder;

    //Verificar que el usuario esté logueado
    const session: any = await getSession({ req });
    if( !session ) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    //Crear un arreglo de productos
    const productsIds = orderItems.map( product => product._id );
    await db.connect();
    const dbProducts = await Product.find({ _id: { $in: productsIds } });

    try {
        const subtotal = orderItems.reduce((prev, current) => {
            const currentPrice = dbProducts.find( prod => prod.id === current._id )?.price;
            if ( !currentPrice ) {
                throw new Error('Verifique el carrito de compras, el producto no existe');
            }
            return prev + (current.quantity * currentPrice)
        }, 0);

        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
        const backendTotal = subtotal * ( 1 + taxRate );

        if ( total !== backendTotal ) {
            throw new Error('El total no coincide con el total del backend');
        }

        const userId = session.user._id;
        const newOrder = new Order({ ...req.body, isPaid: false, user: userId });
        newOrder.total = Math.round(newOrder.total * 100) / 100;
        await newOrder.save();
        await db.disconnect();
        return res.status(201).json( newOrder );
        
    } catch (error: any) {
        await db.disconnect();
        console.log(error);
        res.status(400).json({ message: error.message || 'Revise logs del servidor'});
    }

    // return res.status(201).json( req.body );
}

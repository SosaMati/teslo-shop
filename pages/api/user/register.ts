import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

import { db } from '../../../database';
import { User } from '../../../models';
import { jwt, validations } from '../../../utils';

type Data = 
| { message: string }
| { 
    token: string;
    user: {
        email: string;
        name: string;
        role: string;
    }
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return registerUser(req, res);
        default:
            res.status(400).json({
                message: 'Invalid request method'
            })
    }
}

const registerUser = async(req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = '', name = '' } = req.body as { email: string, password: string, name: string };
    
    if( password.length < 6 ) {
        return res.status(400).json({
            message: 'La contraseña debe tener al menos 6 caracteres'
        });
    }
    
    if( name.length < 2 ) {
        return res.status(400).json({
            message: 'El nombre debe tener al menos 2 caracteres'
        });
    }
    
    if ( !validations.isValidEmail(email) ) {
        return res.status(400).json({
            message: 'El email no es válido'
        });
    }
    
    await db.connect();
    const user = await User.findOne({ email });  

    if (user) {
        await db.disconnect();
        return res.status(400).json({
            message: 'El usuario ya existe'
        });
    }

    const newUser = new User({ 
        email: email.toLowerCase(),
        password: bcrypt.hashSync( password ),
        role: 'client',
        name,
    });

    try {
        await newUser.save({ validateBeforeSave: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Error en el servidor'
        }); 
    }

    const { _id, role } = new User;

    const token = jwt.singToken( _id, email );

    return res.status(200).json({
        token, //jwt
        user: {
            email, 
            role, 
            name
        }
    });
}


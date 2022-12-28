import jwt from 'jsonwebtoken';

export const singToken = ( _id: string, email: string ) => {

    if ( !process.env.JWT_SECRET_SEED ) {
        throw new Error('JWT_SECRET_SEED not defined');
    }

    return jwt.sign(
        //Payload
        { _id, email },

        //Seed
        process.env.JWT_SECRET_SEED,

        //Options
        { expiresIn: '30d' }
    )
}

export const isValidToken = ( token: string ):Promise<string> => {
    if ( !process.env.JWT_SECRET_SEED ) {
        throw new Error('JWT_SECRET_SEED not defined');
    }

    if ( token.length < 10 ) {
        return Promise.reject('Invalid token');
    }

    return new Promise( (resolve, reject) => {

        try {
            jwt.verify( token, process.env.JWT_SECRET_SEED || '', (err, payload) => {
                if ( err ) return reject('JWT no es válido');

                const { _id } = payload as { _id: string };

                resolve( _id );

            })
        } catch(error) {
            reject('JWT no es válido');
        }
    })
}
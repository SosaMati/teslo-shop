import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Grid, Typography } from '@mui/material';

import DashboardOutlined  from '@mui/icons-material/DashboardOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import CreditCardOffOutlined from '@mui/icons-material/CreditCardOffOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import CancelPresentationOutlined from '@mui/icons-material/CancelPresentationOutlined';
import ProductionQuantityLimitsOutlined from '@mui/icons-material/ProductionQuantityLimitsOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';

import { AdminLayout } from '../../components/layouts';
import { SummaryTile } from '../../components/admin';
import { DashboardSummaryResponse } from '../../interfaces';


const DashboardPage = () => {

    const { data, error } = useSWR<DashboardSummaryResponse>('/api/admin/dashboard', { 
        refreshInterval: 30 * 1000 
    });

    const [refreshIn, setRefreshIn] = useState(30);

    useEffect(() => {
      const interval = setInterval(() => {
        setRefreshIn( refreshIn => refreshIn > 0 ? refreshIn - 1 : 30);
      }, 1000);
    
      return () => clearInterval(interval);
    }, []);
    

    if (!error && !data) {
        return <></>;
    };

    if(error) {
        console.log(error);
        return <Typography>Error al cargar la información</Typography>
    };

    const {
        numberOfOrders,
        paidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
        notPaidOrders,
    } = data!;

  return (
    <AdminLayout
        title='Dashboard'
        subTitle='Estadisticas generales'
        icon={ <DashboardOutlined/> }
    >

        <Grid container spacing={2}>
            
            <SummaryTile 
                title={ numberOfOrders }
                subTitle='Ordenes totales'
                icon={ <CreditCardOutlined color='secondary' sx={{ fontSize: 40 }} /> }
            />

            <SummaryTile 
                title={ paidOrders }
                subTitle='Ordenes pagadas'
                icon={ <AttachMoneyOutlined color='success' sx={{ fontSize: 40 }} /> }
            />

            <SummaryTile 
                title={ notPaidOrders }
                subTitle='Ordenes pendientes'
                icon={ <CreditCardOffOutlined color='error' sx={{ fontSize: 40 }} /> }
            />

            <SummaryTile 
                title={ numberOfClients }
                subTitle='Clientes'
                icon={ <GroupOutlined color='primary' sx={{ fontSize: 40 }} /> }
            />

            <SummaryTile 
                title={ numberOfProducts }
                subTitle='Productos'
                icon={ <CategoryOutlined color='warning' sx={{ fontSize: 40 }} /> }
            />

            <SummaryTile 
                title={ productsWithNoInventory }
                subTitle='Sin Existencias'
                icon={ <CancelPresentationOutlined color='error' sx={{ fontSize: 40 }} /> }
            />

            <SummaryTile 
                title={ lowInventory }
                subTitle='Bajo inventario'
                icon={ <ProductionQuantityLimitsOutlined color='warning' sx={{ fontSize: 40 }} /> }
            />

            <SummaryTile 
                title={ refreshIn }
                subTitle='Actualización en:'
                icon={ <AccessTimeOutlined color='secondary' sx={{ fontSize: 40 }} /> }
            />
        </Grid>

    </AdminLayout>
  )
}

export default DashboardPage
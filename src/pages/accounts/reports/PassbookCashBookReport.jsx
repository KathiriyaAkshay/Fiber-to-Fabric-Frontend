import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPassbookCashbookReport } from '../../../api/requests/accounts/reports';
import { GlobalContext } from '../../../contexts/GlobalContext';

const PassbookCashBookReport = () => {
    const { companyId } = useContext(GlobalContext);

    const { data: passbookCashBookData, isLoading, error } = useQuery({
        queryKey: ['passbookCashBookReport', companyId],  // Correctly pass queryKey inside the object
        queryFn: async () => {
            const res = await getPassbookCashbookReport({
                params: {
                    company_id: companyId
                }
            });
            return res;  
        },
        enabled: !!companyId  
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            {passbookCashBookData && JSON.stringify(passbookCashBookData)}
        </div>
    );
};

export default PassbookCashBookReport;

import { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Input } from '../common/ui';

export const CashInputs = () => {
    const cashAmount = useAppStore(s => s.cashAmount);
    const setCashAmount = useAppStore(s => s.setCashAmount);
    const cashFee = useAppStore(s => s.cashFee);
    const setCashFee = useAppStore(s => s.setCashFee);

    const onAmountChange = useCallback((e: any) => setCashAmount(Number(e.target.value)), [setCashAmount]);
    const onFeeChange = useCallback((e: any) => setCashFee(Number(e.target.value)), [setCashFee]);

    return (
        <div className="flex flex-col gap-2 m-2">
            <div className="flex text-gray-700">
                <h1>Cash Amount: </h1>
                <Input
                    type="number"
                    value={cashAmount}
                    onChange={onAmountChange}
                    className="w-24 ml-2"
                />
            </div>

            <div className="flex text-gray-700">
                <h1>Cash Fee: </h1>
                <Input
                    type="number"
                    value={cashFee}
                    onChange={onFeeChange}
                    className="w-24 ml-2"
                />
            </div>
        </div>
    );
}
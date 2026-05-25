import { useAppStore } from '../../stores/appStore';

export const CashInputs = () => {
    const { 
        cashAmount,
        setCashAmount,
        cashFee,
        setCashFee,
    } = useAppStore();

    return (
        <div className="flex flex-col gap-2 m-2">
            <div className="flex text-gray-700">
                <h1>Cash Amount: </h1>
                <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-24 bg-white border border-gray-400 rounded ml-2"
                />
            </div>

            <div className="flex text-gray-700">
                <h1>Cash Fee: </h1>
                <input
                    type="number"
                    value={cashFee}
                    onChange={(e) => setCashFee(Number(e.target.value))}
                    className="w-24 bg-white border border-gray-400 rounded ml-2"
                />
            </div>
        </div>
    );
}
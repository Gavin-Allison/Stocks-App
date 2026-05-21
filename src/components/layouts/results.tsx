import { useAppStore } from "../../stores/appStore"
import { StockDatePicker } from "../common/datepicker"
import { StockPieChart } from "../common/pieChart";

const tempAssets: Record<string, number> = {
    Apple: 70,
    Google: 30,
    Microsoft: 50,
};

export const Results = () => {
    const {
        date,
        setDate
    } = useAppStore();
    return (

        <div className="p-4">
            {/* Header with date picker */}
            <div className="flex items-center justify-between"> 
                <h1 className="text-xl font-bold">Transactions</h1>
                <StockDatePicker className="w-38" date={date} onDateChange={setDate} />
            </div>

            <StockPieChart assets={tempAssets}/>
            
        </div>
    )
}
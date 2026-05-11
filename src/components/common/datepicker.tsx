import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";

export const StockDatePicker = ({ className }: { className?: string }) => {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const handleChange = (date: Date | null) => {
        setSelectedDate(date ? date.toISOString().split('T')[0] : "");
    };

    return <DatePicker selected={selectedDate ? new Date(selectedDate) : null} onChange={handleChange} className={className} />;
};

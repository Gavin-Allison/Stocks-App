import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";

export const StockDatePicker = ({ className, date, onDateChange }: { className?: string; date: string; onDateChange: (date: string) => void }) => {
    const [selectedDate, setSelectedDate] = useState<string>(date);

    const handleChange = (date: Date | null) => {
        setSelectedDate(date ? date.toISOString().split('T')[0] : "");
        onDateChange(date ? date.toISOString().split('T')[0] : "");
    };

    return <DatePicker selected={selectedDate ? new Date(selectedDate) : null} onChange={handleChange} className={className} />;
};

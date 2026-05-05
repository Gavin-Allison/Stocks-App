import { useState } from "react"
import { DatePicker } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";

export const StockDatePicker = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const handleChange = (date: Date | null) => {
        setSelectedDate(date);
    };

    return <DatePicker selected={selectedDate} onChange={handleChange} />;
};

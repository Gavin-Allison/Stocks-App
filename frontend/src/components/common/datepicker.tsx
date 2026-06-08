import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

/**
 * Reusable date picker component bound to the app date state.
 */
export const StockDatePicker = ({ className, date, onDateChange }: { className?: string; date: string; onDateChange: (date: string) => void }) => {
    // Define the valid date range
    const maxDate = dayjs();
    const minDate = dayjs().subtract(5, 'year');
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* Date picker input */}
            <DatePicker
                key={date}
                value={date ? dayjs(date) : null}
                onChange={(newValue) => onDateChange(newValue ? newValue.format('YYYY-MM-DD') : '')}
                format="YYYY-MM-DD"
                minDate={minDate}
                maxDate={maxDate}
                slotProps={{
                    textField: {
                        className: className,
                        size: "small",
                    },
                }}
            />
        </LocalizationProvider>
    );
};

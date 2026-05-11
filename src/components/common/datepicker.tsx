import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export const StockDatePicker = ({ className, date, onDateChange }: { className?: string; date: string; onDateChange: (date: string) => void }) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                value={date ? dayjs(date) : null}
                onChange={(newValue) => onDateChange(newValue ? newValue.format('YYYY-MM-DD') : '')}
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

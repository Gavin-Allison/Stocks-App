import { useAppStore } from '../../stores/appStore';
import { Input } from '../common/ui';

const summarizeSchedule = (frequency: string, interval: number, occurrences: number) => {
    if (frequency === 'NONE' || occurrences === 1) {
        return 'No repeat';
    }

    if (frequency === 'EVERY_X_DAYS') {
        return `Every ${interval} day${interval === 1 ? '' : 's'} for ${occurrences} occurrences`;
    }

    return `${frequency.charAt(0) + frequency.slice(1).toLowerCase()} for ${occurrences} occurrences`;
};

export const RepeatSchedule = () => {
    const {
        date,
        repeatScheduleOpen,
        repeatFrequency,
        repeatIntervalDays,
        repeatOccurrences,
        setRepeatScheduleOpen,
        setRepeatFrequency,
        setRepeatIntervalDays,
        setRepeatOccurrences,
    } = useAppStore();

    const summary = summarizeSchedule(repeatFrequency, repeatIntervalDays, repeatOccurrences);

    return (
        <div className="border-t border-gray-300 bg-gray-200 mt-3">
            <button
                type="button"
                onClick={() => setRepeatScheduleOpen(!repeatScheduleOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-300"
            >
                <span>Repeat schedule</span>
                <span className="text-gray-600">{repeatScheduleOpen ? 'Hide' : summary}</span>
            </button>

            {repeatScheduleOpen && (
                <div className="px-3 pb-3 pt-2">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-700">Frequency</label>
                            <select
                                value={repeatFrequency}
                                onChange={(e) => setRepeatFrequency(e.target.value as any)}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                                <option value="NONE">None</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="EVERY_X_DAYS">Every X Days</option>
                            </select>
                        </div>

                        {repeatFrequency === 'EVERY_X_DAYS' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-700">Interval</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={repeatIntervalDays}
                                        onChange={(e) => setRepeatIntervalDays(Math.max(1, Number(e.target.value)))}
                                        className="w-20"
                                    />
                                    <span className="text-sm text-gray-600">days</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-700">Occurrences</label>
                            <Input
                                type="number"
                                min={1}
                                value={repeatOccurrences}
                                onChange={(e) => setRepeatOccurrences(Math.max(1, Number(e.target.value)))}
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                            <span>Start date</span>
                            <span className="font-medium text-gray-800">{date}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

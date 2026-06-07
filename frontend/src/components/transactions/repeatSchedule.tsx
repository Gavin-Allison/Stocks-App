import { useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Input } from '../common/ui';
import { theme } from '../../styles/tokens';

/**
 * Summary formatter for the repeat schedule controls.
 */
const summarizeSchedule = (frequency: string, interval: number, occurrences: number) => {
    if (frequency === 'NONE' || occurrences === 1) {
        return 'No repeat';
    }

    if (frequency === 'EVERY_X_DAYS') {
        return `Every ${interval} day${interval === 1 ? '' : 's'} for ${occurrences} occurrences`;
    }

    return `${frequency.charAt(0) + frequency.slice(1).toLowerCase()} for ${occurrences} occurrences`;
};

/**
 * Repeat schedule panel used by transaction inputs to configure recurring execution.
 */
export const RepeatSchedule = () => {
    const date = useAppStore(s => s.date);
    const repeatScheduleOpen = useAppStore(s => s.repeatScheduleOpen);
    const repeatFrequency = useAppStore(s => s.repeatFrequency);
    const repeatIntervalDays = useAppStore(s => s.repeatIntervalDays);
    const repeatOccurrences = useAppStore(s => s.repeatOccurrences);
    const setRepeatScheduleOpen = useAppStore(s => s.setRepeatScheduleOpen);
    const setRepeatFrequency = useAppStore(s => s.setRepeatFrequency);
    const setRepeatIntervalDays = useAppStore(s => s.setRepeatIntervalDays);
    const setRepeatOccurrences = useAppStore(s => s.setRepeatOccurrences);

    const summary = summarizeSchedule(repeatFrequency, repeatIntervalDays, repeatOccurrences);

    const toggleOpen = useCallback(() => setRepeatScheduleOpen(!repeatScheduleOpen), [setRepeatScheduleOpen, repeatScheduleOpen]);

    return (
        <div className={`border-t ${theme.layout.sectionBorder} ${theme.layout.sectionBg} mt-3`}>
            <button
                type="button"
                onClick={toggleOpen}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm font-semibold ${theme.text.secondary} hover:bg-gray-300`}
            >
                <span>Repeat schedule</span>
                <span className={theme.text.muted}>{repeatScheduleOpen ? 'Hide' : summary}</span>
            </button>

            {repeatScheduleOpen && (
                <div className="pl-2 pb-3 pt-2">
                    <div className="flex flex-wrap">
                        <div className="flex flex-col gap-1 min-w-[120px]">
                            <label className={`text-sm ${theme.text.secondary}`}>Frequency</label>
                            <select
                                value={repeatFrequency}
                                onChange={(e) => setRepeatFrequency(e.target.value as any)}
                                className={`${theme.input.base} w-full max-w-28 px-2 py-1 text-sm`}
                            >
                                <option value="NONE">None</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="EVERY_X_DAYS">Every X Days</option>
                            </select>
                        </div>

                        {repeatFrequency === 'EVERY_X_DAYS' && (
                            <div className="flex flex-col gap-1 min-w-[80px] mr-2">
                                <label className={`text-sm ${theme.text.secondary}`}>Interval</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={repeatIntervalDays}
                                        onChange={(e) => setRepeatIntervalDays(Math.max(1, Number(e.target.value)))}
                                        className="h-7 w-20"
                                    />
                                    <span className={
                                        `text-sm ${theme.text.muted}`
                                    }>days</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1 min-w-[100px]">
                            <label className={`text-sm ${theme.text.secondary}`}>Occurrences</label>
                            <Input
                                type="number"
                                min={1}
                                value={repeatOccurrences}
                                onChange={(e) => setRepeatOccurrences(Math.max(1, Number(e.target.value)))}
                                className="h-7 w-20"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 text-sm min-w-[80px]">
                            <span className={theme.text.muted}>Start date</span>
                            <span className={`font-medium ${theme.text.secondary}`}>{date}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
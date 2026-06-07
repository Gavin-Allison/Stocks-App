import { useAppStore } from "../../stores/appStore";

import { Transactions } from "./transactions"
import { Results } from "./results"

/**
 * Report panel that switches between Transactions and Results views.
 */
export const Report = () => {
    const reportTab = useAppStore(s => s.reportTab);

    if (reportTab === "Transactions") {
        return <Transactions />
    } else {
        return <Results />;
    }
}
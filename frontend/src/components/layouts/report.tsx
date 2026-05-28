import { useAppStore } from "../../stores/appStore";

import { Transactions } from "./transactions"
import { Results } from "./results"

export const Report = () => {
    const { reportTab } = useAppStore();

    if (reportTab === "Transactions") {
        return <Transactions />
    } else {
        return <Results />;
    }
}
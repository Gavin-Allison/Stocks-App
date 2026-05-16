import { useAppStore } from "../../stores/appStore";

import { Tutorial } from "../!TODO/tutorial"
import { Overview } from "../!TODO/overview"
import { Transactions } from "../transactions/transactions"
import { Results } from "../!TODO/results"

export const Report = () => {
    const { reportTab } = useAppStore();

    if (reportTab === "Tutorial") {
        return <Tutorial />;
    } else if (reportTab === "Overview") {
        return <Overview />;
    } else if (reportTab === "Transactions") {
        return <Transactions />
    } else {
        return <Results />;
    }
}
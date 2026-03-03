import { addMonths, format } from "date-fns";

function testInstallments(startDateStr: string, installments: number) {
    const [year, month, day] = startDateStr.split('-').map(Number);
    console.log(`Testing start date: ${startDateStr} for ${installments} installments`);

    for (let i = 1; i <= installments; i++) {
        // This simulates the logic in the services
        let installmentDateObj = addMonths(new Date(year, month - 1, day), i - 1);
        const installmentDate = format(installmentDateObj, 'yyyy-MM-dd');
        console.log(`Installment ${i}: ${installmentDate}`);
    }
}

testInstallments("2026-03-03", 3);
testInstallments("2026-01-31", 3); // Test end of month
testInstallments("2026-03-31", 3); // Test end of month

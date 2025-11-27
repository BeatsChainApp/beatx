import { generatePDF, fillSAMROForm } from './service';
import { SplitSheet } from './schema';

export function createSplitSheet(data: SplitSheet) {
  return generatePDF(data);
}

export function fillSAMROPDF(userData: any, contributors: any[]) {
  return fillSAMROForm(userData, contributors);
}

export * from './schema';
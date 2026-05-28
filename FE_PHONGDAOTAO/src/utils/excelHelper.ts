import * as XLSX from 'xlsx';
import { Student } from '../services/apiUser/StudentAPI';

export const parseStudentExcel = (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length <= 1) {
          throw new Error('File Excel không có dữ liệu hoặc chỉ có tiêu đề');
        }

        // Clean headers to trace columns
        const headers = data[0].map((h) =>
          String(h || '')
            .trim()
            .toLowerCase(),
        );

        // Find index of columns:
        // Mã sinh viên
        const codeIdx = headers.findIndex(
          (h) =>
            h.includes('mã sinh viên') ||
            h.includes('mssv') ||
            h.includes('student code') ||
            h.includes('code'),
        );

        // Họ lót
        const firstNameIdx = headers.findIndex(
          (h) =>
            h.includes('họ lót') ||
            h.includes('ho lot') ||
            h.includes('họ đệm') ||
            h.includes('first name') ||
            h.includes('last name'),
        );

        // Tên
        const lastNameIdx = headers.findIndex(
          (h) =>
            h.includes('tên') ||
            h.includes('ten') ||
            (h.includes('name') && !h.includes('họ')),
        );

        // Mã lớp (Or Tên lớp if Mã lớp is not found)
        let classIdx = headers.findIndex(
          (h) =>
            h.includes('mã lớp') ||
            h.includes('ma lop') ||
            h.includes('lớp') ||
            h.includes('class'),
        );
        if (classIdx === -1) {
          classIdx = headers.findIndex(
            (h) => h.includes('tên lớp') || h.includes('ten lop'),
          );
        }

        // Email
        const emailIdx = headers.findIndex(
          (h) => h.includes('email') || h.includes('thư điện tử'),
        );

        // Error message if required columns are missing
        const missingColumns: string[] = [];
        if (codeIdx === -1) missingColumns.push('Mã sinh viên');
        if (lastNameIdx === -1) missingColumns.push('Tên');
        if (classIdx === -1) missingColumns.push('Mã lớp / Lớp học');
        if (emailIdx === -1) missingColumns.push('Email');

        if (missingColumns.length > 0) {
          throw new Error(
            `File Excel thiếu các cột bắt buộc: ${missingColumns.join(', ')}`,
          );
        }

        const parsedStudents: Student[] = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row.length === 0 || !row[codeIdx]) continue; // Skip empty rows or rows without student code

          // Concatenate Họ lót and Tên if Họ lót exists
          let fullName = '';
          const lastName = String(row[lastNameIdx] || '').trim();
          if (
            firstNameIdx !== -1 &&
            row[firstNameIdx] !== undefined &&
            row[firstNameIdx] !== null
          ) {
            const firstName = String(row[firstNameIdx] || '').trim();
            fullName = `${firstName} ${lastName}`.trim();
          } else {
            fullName = lastName;
          }

          parsedStudents.push({
            studentCode: String(row[codeIdx] || '').trim(),
            name: fullName,
            class: String(row[classIdx] || '').trim(),
            email: String(row[emailIdx] || '').trim(),
          });
        }

        resolve(parsedStudents);
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

import * as Excel from 'exceljs';
import * as R from 'ramda';
import { Controller, Get, UseInterceptors, Logger } from '@nestjs/common';
import * as ID from 'nodejs-unique-numeric-id-generator';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { getUTCTimestamp } from '@util/util';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

// function delay(time) {
//   return new Promise(resolve => setTimeout(resolve, time));
// }

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) { }

  @Get('/')
  @UseInterceptors(ResponseInterceptor)
  async hello() {
    try {
      this.logger.debug('Root');

      // 人员名单
      const personWB = new Excel.Workbook();
      await personWB.xlsx.readFile('C:\\Users\\supcon\\OneDrive\\文档\\zhao\\person2.xlsx');
      // await personWB.xlsx.readFile('/mnt/d/data/OneDrive/文档/zhao/person2.xlsx');
      const personWS = personWB.getWorksheet('sheet1');

      // 目标文件
      const tableFilepath = 'C:\\Users\\supcon\\OneDrive\\文档\\zhao\\table.xlsx';
      // const tableFilepath = '/mnt/d/data/OneDrive/文档/zhao/table.xlsx';
      const tableWB = new Excel.Workbook();
      await tableWB.xlsx.readFile(tableFilepath);

      // 目标模板 sheet 页
      const templateWS = tableWB.getWorksheet('template');

      let personCount = 0;
      let currentPersonName = '';
      personWS.eachRow((row, rowNumber) => {
        // const currentRow = testWS.getRow(rowNumber);
        if (personCount < 2) {
          // 跨过前两行
          personCount += 1;
          return;
        }
        personCount += 1;

        let currentPersonSheet: Excel.Worksheet;
        let contractStart;
        row.eachCell((cell, cellNumber) => {
          if (cellNumber === 1) {
            // 序号
            return;
          }

          const cellData = cell.value.toString();
          if (cellNumber === 2) {
            // 姓名
            currentPersonName = cellData;

            const sheetExistIdx = R.findIndex(R.propEq('name', currentPersonName))(tableWB.worksheets);
            if (sheetExistIdx === -1) {
              currentPersonSheet = tableWB.addWorksheet(currentPersonName);
            } else {
              currentPersonSheet = tableWB.addWorksheet(`${currentPersonName}-${rowNumber}`);
            }

            templateWS.eachRow((row, rowNumber) => {
              const currentPersonNewRow = currentPersonSheet.getRow(rowNumber);
              currentPersonNewRow.height = templateWS.getRow(rowNumber).height;

              // currentPersonNewRow.height = 
              row.eachCell((cell, colNumber) => {
                const newCell = currentPersonNewRow.getCell(colNumber);
                for (const prop in cell) {
                  newCell[prop] = cell[prop];
                }
                cell.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" }
                }
              })
            });

            const nameCell = currentPersonSheet.getCell('C3');
            nameCell.value = cellData;
            this.setCellStyle(nameCell);

            currentPersonSheet.getColumn('C').width = 15;
            const g6Cell = currentPersonSheet.getCell('G6');
            this.setCellStyle(g6Cell);

            const e6Cell = currentPersonSheet.getCell('E6');
            this.setCellStyle(e6Cell);

            const i6Cell = currentPersonSheet.getCell('I6');
            this.setCellStyle(i6Cell);
            return;
          }

          if (!currentPersonSheet) {
            currentPersonSheet = tableWB.getWorksheet(currentPersonName);
          }

          if (cellNumber === 3) {
            // 证件类型
            if (currentPersonSheet) {
              const idTypeCell = currentPersonSheet.getCell('C4');
              idTypeCell.value = cellData;
              this.setCellStyle(idTypeCell);
            }
          }
          if (cellNumber === 4) {
            // 证件号
            if (currentPersonSheet) {
              const idCell = currentPersonSheet.getCell('E4');
              idCell.value = cellData;
              this.setCellStyle(idCell);
            }
          }
          if (cellNumber === 5) {
            // 合同金额
            if (currentPersonSheet) {
              const contractCountCell = currentPersonSheet.getCell('C5');
              contractCountCell.value = cellData;
              this.setCellStyle(contractCountCell);

              const borrowCountCell = currentPersonSheet.getCell('E5');
              borrowCountCell.value = '1';
              this.setCellStyle(borrowCountCell);

              const checkCell = currentPersonSheet.getCell('C9');
              checkCell.value = cellData;
              this.setCellStyle(checkCell);

              const checkCountCell = currentPersonSheet.getCell('E9');
              checkCountCell.value = '1';
              this.setCellStyle(checkCountCell);
            }
          }
          if (cellNumber === 6) {
            // 合同开始日
            contractStart = cellData;
          }
          if (cellNumber === 7) {
            // 合同到期日
            if (currentPersonSheet) {
              const contractDataCell = currentPersonSheet.getCell('C7');
              contractDataCell.value = `${contractStart} 至 ${cellData}`;
              this.setCellStyle(contractDataCell);
            }
          }
          if (cellNumber === 8) {
            // 住址
            if (currentPersonSheet) {
              const addrCell = currentPersonSheet.getCell('G3');
              const result = (cell.value as any).result;
              if (result && typeof result === 'string') {
                const cellData = (cell.value as any).result.toString();
                addrCell.value = cellData;
                this.setCellStyle(addrCell);
              }
            }
          }
          if (cellNumber === 9) {
            // 用途
            if (currentPersonSheet) {
              const useCell = currentPersonSheet.getCell('E7');
              const result = (cell.value as any).result;
              if (result && typeof result === 'string') {
                const cellData = (cell.value as any).result.toString();
                useCell.value = cellData;
                this.setCellStyle(useCell);
              }
            }
          }
        })
      });

      tableWB.xlsx.writeFile(tableFilepath);

      return 'Hello Nestjs Template!'
    } catch (error) {
      console.error('HTTP request failed.', error);
    }

    return 'error!';
  }

  private setCellStyle = (cell: Excel.Cell) => {
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.font = { size: 12 };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    }
  }

  @Get('id/getId')
  @ApiOperation({
    summary: '唯一 ID',
    description: '获取从服务器上分配的唯一 ID（数值型）',
  })
  @ApiResponse({
    status: 200,
    description: '返回唯一 ID',
    type: Number,
  })
  @UseInterceptors(ResponseInterceptor)
  uniqueId() {
    const utc = getUTCTimestamp();
    const id = ID.generate(new Date().toJSON());
    return { data: id, lastOperateTime: utc };
  }
}

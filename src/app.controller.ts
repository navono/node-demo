import * as Excel from 'exceljs';
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
      await personWB.xlsx.readFile('D:\\data\\OneDrive\\文档\\zhao\\person2.xlsx');
      const personWS = personWB.getWorksheet('sheet1');

      // 目标文件
      const tableFilepath = 'D:\\data\\OneDrive\\文档\\zhao\\table.xlsx';
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

        let currentPersonSheet;
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
            currentPersonSheet = tableWB.addWorksheet(currentPersonName);

            templateWS.eachRow((row, rowNumber) => {
              const currentPersonNewRow = currentPersonSheet.getRow(rowNumber);
              row.eachCell((cell, colNumber) => {
                const newCell = currentPersonNewRow.getCell(colNumber);
                for (const prop in cell) {
                  newCell[prop] = cell[prop];
                }
              })
            });

            currentPersonSheet.getRow(3).getCell('C3').value = cellData;
            return;
          }

          if (!currentPersonSheet) {
            currentPersonSheet = tableWB.getWorksheet(currentPersonName);
          }

          if (cellNumber === 3) {
            // 证件类型
            if (currentPersonSheet) {
              currentPersonSheet.getRow(4).getCell('C4').value = cellData;
            }
          }
          if (cellNumber === 4) {
            // 证件号
            if (currentPersonSheet) {
              currentPersonSheet.getRow(4).getCell('E5').value = cellData;
            }
          }
          if (cellNumber === 5) {
            // 合同金额
            if (currentPersonSheet) {
              currentPersonSheet.getRow(5).getCell('C5').value = cellData;
            }
          }
          if (cellNumber === 6) {
            // 合同开始日
            contractStart = cellData;
          }
          if (cellNumber === 7) {
            // 合同到期日
            if (currentPersonSheet) {
              currentPersonSheet.getRow(7).getCell('C7').value = `${contractStart} 至 ${cellData}`;
            }
          }

          console.error(rowNumber, cellNumber, cell.value);
        })
      });

      tableWB.xlsx.writeFile(tableFilepath);

      return 'Hello Nestjs Template!'
    } catch (error) {
      console.error('HTTP request failed.', error);
    }

    return 'error!';
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

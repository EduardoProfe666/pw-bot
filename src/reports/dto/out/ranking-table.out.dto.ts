import { ApiProperty } from '@nestjs/swagger';

export class RankingRow {
  @ApiProperty()
  position: number;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  avg: number;
}

export default class RankingTableOutDto {
  @ApiProperty({type: [RankingRow]})
  ranking: RankingRow[];

}
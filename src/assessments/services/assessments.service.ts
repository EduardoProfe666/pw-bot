import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PgService from '../../database/services/pg.service';
import AssessmentInDto from '../dto/in/assessment.in.dto';
import Assessment from '../../database/entities/assessment.entity';
import AssessmentOutDto from '../dto/out/assessment.out.dto';

@Injectable()
export default class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);

  constructor(private readonly pgService: PgService) {}

  public async getAll(): Promise<AssessmentOutDto[]> {
    const assessments = await this.pgService.assessments.find({
      order: {
        id: 'ASC'
      }
    });
    return assessments.map((assessment) => this.toOutDto(assessment));
  }

  public async getById(id: number): Promise<AssessmentOutDto> {
    const assessment = await this.pgService.assessments.findOne({
      where: { id },
    });
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }
    return this.toOutDto(assessment);
  }

  public async put(id: number, dto: AssessmentInDto): Promise<void> {
    const assessment = await this.pgService.assessments.findOne({
      where: { id },
    });
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    const a = await this.pgService.assessments.findOne({
      where: { name: dto.name },
    });
    if (a && a.id !== id) {
      throw new ConflictException(
        `Assessment with name "${dto.name}" already exists`,
      );
    }

    await this.pgService.assessments.update(id, dto);
    this.logger.log(`Updated assessment with ID ${id}`);
    this.logger.log({ ...dto });
  }

  public async post(dto: AssessmentInDto): Promise<AssessmentOutDto> {
    const existingAssessment = await this.pgService.assessments.findOne({
      where: { name: dto.name },
    });
    if (existingAssessment) {
      throw new ConflictException(
        `Assessment with name "${dto.name}" already exists`,
      );
    }

    const newAssessment = this.pgService.assessments.create(dto);
    await this.pgService.assessments.save(newAssessment);

    this.logger.log(`Created new assessment with ID ${newAssessment.id}`);
    this.logger.log({ ...dto });
    return this.toOutDto(newAssessment);
  }

  public async delete(id: number): Promise<void> {
    const result = await this.pgService.assessments.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    this.logger.log(`Deleted assessment with ID ${id}`);
  }

  private toOutDto(assessment: Assessment): AssessmentOutDto {
    return {
      id: assessment.id,
      name: assessment.name,
    };
  }
}

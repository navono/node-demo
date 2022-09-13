import { Injectable } from "@nestjs/common";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

@Injectable()
export class TagSubDto {
  @IsNotEmpty()
  @IsString()
  public readonly action: string;

  @IsNotEmpty()
  @IsString()
  public readonly type: string;

  @IsNotEmpty()
  @IsArray()
  public readonly content: string[];

  @IsNotEmpty()
  @IsString()
  public readonly notifyTopic: string;
}
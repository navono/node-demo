import { homedir } from 'os';
import * as fse from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { ensureCustomDir } from '@util/util';

interface IHMIConfig {
  http: {
    host: string;
    port: number;
  };
  db: {
    sqlit: string;
  };
  log: {
    file: string;
    interval: string;
    fileSize: string;
    maxFiles: number;
    compress: boolean;
    level: string;
  };

  // 用户数据根目录
  dataDir: string;

  // 用于存放用户上传的临时数据（在 dataDir 之下）
  uploadDir: string;
  uploadPicDir: string;
  uploadWidgetDir: string;
  uploadThemeDir: string;
  uploadResourceDir: string;
  // 点组
  uploadTagGroupDir: string;

  // 数据目录（在 dataDir 之下）
  assetsDir: string;
  // 静态监听目录（在 assets 之下）
  assetsStaticDir: string;
  // 流程图目录（在 assets 之下）
  assetsPicDir: string;
  assetsThemeDir: string;
  assetsTagGroupDir: string;

  // 在 staticDir 之下
  staticResourceDir: string;
  staticControlDir: string;
  staticPanelDir: string;

  [index: string]: any;
}

export const hostDataDirName = 'hmikit';

const getConfigContent = () => {
  const YAML_CONFIG_FILENAME = 'config.yaml';

  let configFilePath;
  if (process.env.NODE_ENV === 'development') {
    configFilePath = path.join(__dirname, '../../conf', YAML_CONFIG_FILENAME);
  } else {
    configFilePath = path.join(__dirname, '../conf', YAML_CONFIG_FILENAME);
  }

  const config = yaml.load(
    fse.readFileSync(configFilePath, 'utf8'),
  ) as IHMIConfig;

  // 数据根目录
  const basePath = homedir();
  config.dataDir = ensureCustomDir(basePath, hostDataDirName);

  config.uploadDir = ensureCustomDir(config.dataDir, 'upload');
  config.uploadPicDir = ensureCustomDir(config.uploadDir, 'pic');
  config.uploadWidgetDir = ensureCustomDir(config.uploadDir, 'widget');
  config.uploadThemeDir = ensureCustomDir(config.uploadDir, 'theme');
  config.uploadResourceDir = ensureCustomDir(config.uploadDir, 'resource');
  config.uploadTagGroupDir = ensureCustomDir(config.uploadDir, 'tagGroup');

  config.assetsDir = ensureCustomDir(config.dataDir, 'assets');
  config.assetsStaticDir = ensureCustomDir(config.assetsDir, 'static');
  config.staticResourceDir = ensureCustomDir(
    config.assetsStaticDir,
    'resource',
  );
  config.staticControlDir = ensureCustomDir(config.assetsStaticDir, 'control');
  config.staticPanelDir = ensureCustomDir(config.assetsStaticDir, 'varPanel');

  config.assetsPicDir = ensureCustomDir(config.assetsDir, 'pic');

  config.assetsThemeDir = ensureCustomDir(config.assetsDir, 'theme');
  config.assetsTagGroupDir = ensureCustomDir(config.assetsDir, 'tagGroup');
  // config.assetsWidgetDir = ensureCustomDir(config.assetsDir, 'widget');

  return config;
};

const hmiConfig = getConfigContent();

export { hmiConfig };

import * as path from 'path';

interface IHMIPresetConfig {
  toolbarPath: string;
  toolbarManifestPath: string;
  defaultModelPath: string;
  defaultThemePath: string;
  varTypePath: string;
  varTypeJsonPath: string;
  vxCollectorVarTypeDiffJsonPath: string;
  tagGroupExamplePath: string;
  panelPath: string;
  sysModelImgPath: string;
}

const presetProdPath = path.join(__dirname, '../conf/preset/');
const presetDevPath = path.join(__dirname, '../../conf/preset/');

const getPresetConfigContent = (): IHMIPresetConfig => {
  const presetPath =
    process.env.NODE_ENV === 'development' ? presetDevPath : presetProdPath;

  const toolbarPath = path.join(presetPath, 'toolbar');
  const toolbarManifestPath = path.join(presetPath, 'toolbar/manifest.json');
  const defaultModelPath = path.join(presetPath, 'default-model.json');
  const defaultThemePath = path.join(presetPath, 'default-theme.json');
  const varTypePath = path.join(presetPath, 'varType');
  const varTypeJsonPath = path.join(varTypePath, 'builtinVarType.json');
  const vxCollectorVarTypeDiffJsonPath = path.join(
    varTypePath,
    'VxCollector_typeDiff.json',
  );

  const tagGroupExamplePath = path.join(presetPath, 'tagGroupExample.csv');
  const panelPath = path.join(presetPath, 'panel');
  const sysModelImgPath = path.join(presetPath, 'modelImg');

  return {
    toolbarPath,
    toolbarManifestPath,
    defaultModelPath,
    defaultThemePath,
    varTypePath,
    varTypeJsonPath,
    vxCollectorVarTypeDiffJsonPath,
    tagGroupExamplePath,
    panelPath,
    sysModelImgPath,
  };
};

const presetConfig = getPresetConfigContent();

export { presetConfig };

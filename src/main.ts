import cluster from 'cluster';

if (cluster.isPrimary) {
  // 主进程引入mqtt订阅服务
  import('./modules/mqtt-main').then(async suber => {
    await suber.bootstrap();
  });
  // 启动5个处理进程
  for (let i = 0; i < 5; i++) {
    cluster.fork();
  }
} else {
  // 工作进程
  import('./modules/mqtt-processor').then(async processor => {
    await processor.bootstrap();
  });
}
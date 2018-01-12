require.config({
  paths: {
    tgz: './breakdown',
    chart: './chart',
  }
});
require(['tgz', 'chart'], function(tgz, chart, $) {
  var report = new Report();
  report.onLoad();
})

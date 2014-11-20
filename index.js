var _ = require('lodash')
var glob = require('glob')
var path = require('path')
var async = require('async')
var spawn = require('child_process').spawn
var dryRun = _.contains(process.argv, '-n')

var files = glob.sync('*.jpg')

files = _.groupBy(files, function (f) {
  var output = f

  var match = f.match(/(.+)\sp(\d)(.+)/)

  if (match) output = match[1] + match[3]
  return path.basename(output, path.extname(output)) + '.pdf'
})

console.log('Conversions:\n', files)


async.eachSeries(_.pairs(files), function (file, callback) {
  var output = file[0],
      inputs = file[1]

  var args = _.sortBy(inputs)
  args.push(output)

  console.log('convert', args)
  if (dryRun) return callback()

  spawn('convert', args)
  .on('close', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) return callback()
    return callback(new Error('Child process failed with code ' + code))
  })

}, function (err) {
  if (err) throw err
  console.log('DONE')
})

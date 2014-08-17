#!/usr/bin/env python

import sys

if sys.version_info < (2, 7):
	print("This script requires at least Python 2.7.")
	print("Please, update to a newer version: http://www.python.org/download/releases/")
	exit()

import argparse
import json
import os
import shutil
import tempfile


def main(argv=None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--include', action='append', required=True)
	parser.add_argument('--externs', action='append', default=['externs/common.js'])
	parser.add_argument('--minify', action='store_true', default=False)
	parser.add_argument('--output', default='../includes.html')
	parser.add_argument('--sourcemaps', action='store_true', default=False)

	args = parser.parse_args()

	output = args.output

	# merge

	print(' * Building ' + output)

	# enable sourcemaps support

	if args.sourcemaps:
		sourcemap = output + '.map'
		sourcemapping = '\n//@ sourceMappingURL=' + sourcemap
		sourcemapargs = ' --create_source_map ' + sourcemap + ' --source_map_format=V3'
	else:
		sourcemap = sourcemapping = sourcemapargs = ''

	#fd, path = tempfile.mkstemp()
	tmp = open(output, 'w')
	sources = []

	for include in args.include:
		with open('includes/' + include + '.json','r') as f: files = json.load(f)
		for filename in files:
			filename = 'js/' + filename;
			tmp.write('<script src="'+ filename + '"></script>\n')

	tmp.close()

if __name__ == "__main__":
	main()

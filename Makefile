# ezPAARSE's Makefile

# Doc section
# # # # # # # # #

DOC_DIR:=$(shell pwd)/doc
DOC_MD=$(DOC_DIR)
DOC=$(wildcard $(DOC_MD)/*.md)
DOC_OUTPUT=$(shell pwd)/public/doc
DOC_HTML=$(DOC_OUTPUT)/index.html

# Run every steps needed to start ezpaarse
all: checkconfig build

# Generate doc with beautiful-docs
$(DOC_HTML): $(DOC)
	@bfdocs --base-url='.' $(DOC_MD)/manifest.json $(DOC_OUTPUT)

doc: $(DOC_HTML)

doctest:
	@echo $(DOC_HTML) $(DOC)

docclean:
	@rm -rf $(DOC_OUTPUT)

docopen: doc $(DOC_HMTL)
	@google-chrome file://$(DOC_HTML) 2>/dev/null &

# Tests section
# # # # # # # # #

EZPATH = $(shell pwd)
JSFILES=$(wildcard $(EZPATH)/*.js) $(wildcard $(EZPATH)/test/*.js)  $(wildcard $(EZPATH)/routes/*.js)

# Runs all tests (*-test.js) in the test folder
test:
	@mocha

test-verbose:
	@mocha --reporter list

jshint:
	@jshint $(JSFILES) --config .jshintrc

build:
	@./bin/buildnode

# Application section
# # # # # # # # # # # #

checkconfig:
	@if which node > /dev/null; then ./bin/checkconfig; else echo "Node.js was not found" >&2; fi

start:
	@./bin/ezpaarse start
stop:
	@./bin/ezpaarse stop
status:
	@./bin/ezpaarse status

# Benchmarks section
# # # # # # # # # # # #

PID:=`cat $(shell pwd)/ezpaarse.pid`
bench:
	@echo "Starting ezPAARSE bench (please wait 120 seconds)."
	@./bin/logfaker --duration=120 --rate=500 | ./bin/loginjector | ./bin/monitor --pid=$(PID) --each=2 > ./bench.csv
	@gnuplot ./misc/monitor.gplot > ./bench.png
	@echo "ezPAARSE bench finished."
	@echo "./bench.csv contains bench result data"
	@echo "./bench.png contains bench result plot"
	
.PHONY: test checkconfig build
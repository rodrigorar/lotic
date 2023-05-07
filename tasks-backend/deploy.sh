#!/bin/bash

set -euo pipefail

run_unit_tests() {
  hatch run unit-tests
}

run_integration_tests() {
  hatch run integration-tests
}

build() {
  hatch clean && hatch build
}

copy_to_server() {
  scp dist/tasks_server-*.tar.gz ssh rodrigorar@lotic.eu:.
}

run_unit_tests
run_integration_tests
build
copy_to_server
deploy
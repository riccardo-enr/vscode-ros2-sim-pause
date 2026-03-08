cmake_minimum_required(VERSION 3.8)
project(sim_pause_test)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_srvs REQUIRED)
find_package(ros_gz_interfaces REQUIRED)

# test_node — simple counter node, set a breakpoint in the loop
add_executable(test_node src/test_node.cpp)
ament_target_dependencies(test_node rclcpp)
target_compile_options(test_node PRIVATE -g)

# pause_shim — exposes /pause_physics and /unpause_physics (std_srvs/Empty)
# and forwards them to /world/<world>/control (ros_gz_interfaces/srv/ControlWorld)
add_executable(pause_shim src/pause_shim.cpp)
ament_target_dependencies(pause_shim rclcpp std_srvs ros_gz_interfaces)

install(TARGETS test_node pause_shim
  DESTINATION lib/${PROJECT_NAME})

install(DIRECTORY launch config
  DESTINATION share/${PROJECT_NAME})

ament_package()

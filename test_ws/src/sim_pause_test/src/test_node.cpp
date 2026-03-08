#include "rclcpp/rclcpp.hpp"

int main(int argc, char **argv)
{
  rclcpp::init(argc, argv);
  auto node = rclcpp::Node::make_shared("test_node");
  rclcpp::Rate rate(1.0);  // 1 Hz

  int count = 0;
  while (rclcpp::ok()) {
    RCLCPP_INFO(node->get_logger(), "tick %d", count);  // <-- set breakpoint here
    ++count;
    rclcpp::spin_some(node);
    rate.sleep();
  }

  rclcpp::shutdown();
  return 0;
}

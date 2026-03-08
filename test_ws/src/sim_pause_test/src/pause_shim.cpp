/**
 * pause_shim — Gz Harmonic compatibility shim
 *
 * Exposes /pause_physics and /unpause_physics (std_srvs/srv/Empty) so that
 * vscode-ros2-sim-pause can use its default service names without reconfiguration.
 *
 * Internally forwards to /world/<world>/control (ros_gz_interfaces/srv/ControlWorld)
 * which is the actual Gz Harmonic pause API bridged via ros_gz_bridge.
 *
 * Usage:
 *   ros2 run sim_pause_test pause_shim --ros-args -p world_name:=<your_world>
 */

#include "rclcpp/rclcpp.hpp"
#include "std_srvs/srv/empty.hpp"
#include "ros_gz_interfaces/srv/control_world.hpp"

using Empty = std_srvs::srv::Empty;
using ControlWorld = ros_gz_interfaces::srv::ControlWorld;

class PauseShim : public rclcpp::Node
{
public:
  PauseShim() : Node("pause_shim")
  {
    world_name_ = declare_parameter<std::string>("world_name", "default");
    const std::string control_service = "/world/" + world_name_ + "/control";

    control_client_ = create_client<ControlWorld>(control_service);

    pause_server_ = create_service<Empty>(
      "/pause_physics",
      [this](const Empty::Request::SharedPtr, Empty::Response::SharedPtr) {
        send_control(true);
      });

    unpause_server_ = create_service<Empty>(
      "/unpause_physics",
      [this](const Empty::Request::SharedPtr, Empty::Response::SharedPtr) {
        send_control(false);
      });

    RCLCPP_INFO(get_logger(),
      "pause_shim ready — forwarding to /world/%s/control", world_name_.c_str());
  }

private:
  void send_control(bool pause)
  {
    if (!control_client_->wait_for_service(std::chrono::seconds(1))) {
      RCLCPP_WARN(get_logger(), "world control service not available");
      return;
    }
    auto req = std::make_shared<ControlWorld::Request>();
    req->world_control.pause = pause;
    control_client_->async_send_request(req);
    RCLCPP_INFO(get_logger(), pause ? "pausing" : "resuming");
  }

  std::string world_name_;
  rclcpp::Client<ControlWorld>::SharedPtr control_client_;
  rclcpp::Service<Empty>::SharedPtr pause_server_;
  rclcpp::Service<Empty>::SharedPtr unpause_server_;
};

int main(int argc, char **argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<PauseShim>());
  rclcpp::shutdown();
  return 0;
}

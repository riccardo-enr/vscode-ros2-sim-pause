"""
debug.launch.py — launches only test_node for RDE debugging.
Run sim.launch.py first (via preLaunchTask) for Gazebo + bridge + shim.
"""

from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    test_node = Node(
        package='sim_pause_test',
        executable='test_node',
        name='test_node',
        output='screen',
    )

    return LaunchDescription([test_node])

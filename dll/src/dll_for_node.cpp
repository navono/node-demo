// dll_for_node.cpp : 定义 DLL 的导出函数。
//

#include "pch.h"
#include "framework.h"
#include "dll_for_node.h"


// 这是导出变量的一个示例
//DLLFORNODE_API int ndllfornode=0;

// 这是导出函数的一个示例。
DLLFORNODE_API int add(int a, int b)
{
    return a + b;
}

//// 这是已导出类的构造函数。
//Cdllfornode::Cdllfornode()
//{
//    return;
//}
